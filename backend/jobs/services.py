from asgiref.sync import async_to_sync
import logging
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)


def send_job_event(job_id: str, payload: dict):
    """
    This is the bridge. It takes a message and pushes it
    to the Redis Channel Layer so WebSockets can pick it up.
    """

    channel_layer = get_channel_layer()
    if channel_layer is None:
        logger.error("Channel layer is not configured!")
        return

    group_name = f"job_{job_id}"

    async_to_sync(channel_layer.group_send)(
        group_name, {"type": "job.update", "payload": payload}
    )
