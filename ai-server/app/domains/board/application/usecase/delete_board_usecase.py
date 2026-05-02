from app.domains.board.application.usecase.board_repository_port import BoardRepositoryPort


class DeleteBoardUseCase:
    def __init__(self, board_repository: BoardRepositoryPort):
        self._board_repo = board_repository

    def execute(self, board_id: int, account_id: int) -> dict:
        board = self._board_repo.find_by_id(board_id)
        if board is None:
            raise ValueError("존재하지 않는 게시물입니다.")
        if board.account_id != account_id:
            raise PermissionError("본인이 작성한 게시물만 삭제할 수 있습니다.")
        self._board_repo.delete(board_id)
        return {"message": "게시물이 삭제되었습니다."}
