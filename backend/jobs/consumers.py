import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Job


class JobConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.job_id = self.scope["url_route"]["kwargs"]["job_id"]
        self.group_name = f"job_{self.job_id}"

        job_data = await self.get_job_data()

        if job_data is None:
            await self.close(code=4004)
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

        await self.send(
            text_data=json.dumps(
                {
                    "type": "job.snapshot",
                    "payload": job_data,
                }
            )
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def job_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "job.update",
                    "payload": event["payload"],
                }
            )
        )

    @database_sync_to_async
    def get_job_data(self):
        try:
            job = Job.objects.get(id=self.job_id)
        except Job.DoesNotExist:
            return None

        return {
            "id": str(job.id),
            "name": job.name,
            "status": job.status,
            "progress": job.progress,
        }
