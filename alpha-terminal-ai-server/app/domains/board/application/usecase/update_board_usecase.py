from typing import Optional

from app.domains.account.application.usecase.account_repository_port import AccountRepositoryPort
from app.domains.board.application.response.board_list_response import BoardListItemResponse
from app.domains.board.application.usecase.board_repository_port import BoardRepositoryPort


class UpdateBoardUseCase:
    def __init__(self, board_repository: BoardRepositoryPort, account_repository: AccountRepositoryPort):
        self._board_repo = board_repository
        self._account_repo = account_repository

    def execute(self, board_id: int, title: str, content: str) -> Optional[BoardListItemResponse]:
        board = self._board_repo.update(board_id, title, content)
        if board is None:
            return None

        account = self._account_repo.find_by_id(board.account_id)
        nickname = account.nickname if account else "알 수 없음"

        return BoardListItemResponse(
            board_id=board.id,
            title=board.title,
            content=board.content,
            nickname=nickname,
            created_at=board.created_at,
            updated_at=board.updated_at,
            shared_card_id=board.shared_card_id,
        )
