import os
import sqlite3
from sqlalchemy import String, DateTime, Column
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Media(Base):
    __tablename__ = "media"
    media_id = Column(String(64), primary_key=True)
    post_id = Column(String(64))
    user_id = Column(String(64))
    filename = Column(String(255))
    timestamp = Column(DateTime(), default=func.now())

    def __repr__(self) -> str:
        return f"media(media_id={self.media_id!r}\
        , post_id={self.post_id!r}\
        , user_id={self.user_id!r}\
        , filename={self.filename!r}\
        , timestamp={self.timestamp!r})"

def init_db():
    path = os.path.join(os.path.dirname(__file__), 'local')
    if not os.path.exists(path):
        os.makedirs(path)
    media = os.path.join(path, 'media.sqlite')
    if not os.path.exists(media):
        db_media = sqlite3.connect(media)
        with open(os.path.join(os.path.dirname(__file__), 'schema/media.sql'), encoding='utf-8') as f:
            db_media.executescript(f.read())
        db_media.close()
