from datetime import datetime

from sqlalchemy import Column, Boolean, DateTime, Integer, String, Text, UniqueConstraint

from app.infrastructure.database.session import Base


class RawArticleORM(Base):
    __tablename__ = "raw_articles"
    __table_args__ = (
        UniqueConstraint("source_type", "source_doc_id", name="uq_dedup_key"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(20), nullable=False)
    source_name = Column(String(50), nullable=False)
    source_doc_id = Column(String(100), nullable=False)
    url = Column(Text, nullable=False)
    title = Column(String(500), nullable=False)
    body_text = Column(Text, nullable=False)
    published_at = Column(String(50), nullable=False)
    collected_at = Column(String(50), nullable=False)
    symbol = Column(String(6), nullable=False, index=True)
    market = Column(String(10), nullable=True)
    lang = Column(String(5), nullable=False, default="ko")
    author = Column(String(200), nullable=True)
    content_hash = Column(String(100), nullable=False)
    collector_version = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    meta_json = Column(Text, nullable=True)
    is_processed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.now)
