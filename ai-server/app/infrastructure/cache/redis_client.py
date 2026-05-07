import redis
from app.infrastructure.config.settings import get_settings

_settings = get_settings()

_pool = redis.ConnectionPool(
    host=_settings.redis_host,
    port=_settings.redis_port,
    password=_settings.redis_password or None,
    db=_settings.redis_db,
    decode_responses=True,
    max_connections=50,
    socket_keepalive=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

redis_client = redis.Redis(connection_pool=_pool)
