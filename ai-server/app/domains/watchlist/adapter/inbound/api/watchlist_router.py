from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.infrastructure.auth.require_user import require_user
from app.domains.watchlist.adapter.outbound.persistence.watchlist_repository_impl import WatchlistRepositoryImpl
from app.domains.watchlist.application.request.add_watchlist_request import AddWatchlistRequest
from app.domains.watchlist.infrastructure.orm.watchlist_item_orm import WatchlistItemORM
from app.domains.watchlist.application.response.watchlist_response import WatchlistItemResponse
from app.domains.watchlist.application.usecase.add_watchlist_usecase import AddWatchlistUseCase
from app.domains.watchlist.application.usecase.get_watchlist_usecase import GetWatchlistUseCase
from app.domains.watchlist.application.usecase.remove_watchlist_usecase import RemoveWatchlistUseCase
from app.infrastructure.cache.db_cache import get_cached, invalidate_cached, set_cached
from app.infrastructure.cache.redis_client import redis_client
from app.infrastructure.database.session import get_db

_WATCHLIST_TTL = 120  # 2분


def _watchlist_cache_key(account_id: int) -> str:
    return f"alphadesk:watchlist:v1:{account_id}"

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.post("", response_model=WatchlistItemResponse, status_code=201)
async def add_watchlist(
    request: AddWatchlistRequest,
    db: Session = Depends(get_db),
    account_id: int = Depends(require_user),
):
    repository = WatchlistRepositoryImpl(db)
    usecase = AddWatchlistUseCase(repository)
    try:
        result = usecase.execute(request, account_id=account_id)
        invalidate_cached(redis_client, _watchlist_cache_key(account_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("", response_model=List[WatchlistItemResponse])
async def get_watchlist(
    db: Session = Depends(get_db),
    account_id: int = Depends(require_user),
):
    cache_key = _watchlist_cache_key(account_id)
    cached = get_cached(redis_client, cache_key)
    if cached is not None:
        return [WatchlistItemResponse.model_validate(item) for item in cached]

    repository = WatchlistRepositoryImpl(db)
    usecase = GetWatchlistUseCase(repository)
    result = usecase.execute(account_id=account_id)
    set_cached(redis_client, cache_key, [item.model_dump(mode="json") for item in result], _WATCHLIST_TTL)
    return result


@router.delete("/{item_id}", status_code=204)
async def remove_watchlist(
    item_id: int,
    db: Session = Depends(get_db),
    account_id: int = Depends(require_user),
):
    orm = db.query(WatchlistItemORM).filter(WatchlistItemORM.id == item_id).first()
    if orm is None:
        raise HTTPException(status_code=404, detail="관심종목을 찾을 수 없습니다.")
    if orm.account_id != account_id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")

    repository = WatchlistRepositoryImpl(db)
    usecase = RemoveWatchlistUseCase(repository)
    try:
        usecase.execute(item_id)
        invalidate_cached(redis_client, _watchlist_cache_key(account_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
