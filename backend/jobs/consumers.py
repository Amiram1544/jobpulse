import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from .models import Job


class JobConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.job_id = self.scope["url_route"]["kwargs"]["job_id"]
        self.group_name = self.job_id

        await self.channel_layer.group_add(self.job_id, self.group_name)

        await self.accept()

        job_data = await self.get_job_data()
        await self.send(
            text_data=json.dumps({"type": "job.snapshot", "payload": job_data})
        )

    async def disconnect(self):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def job_update(self, event):
        await self.send(
            text_data=json.dumps({"type": "job.update", "payload": event["payload"]})
        )

    @database_sync_to_async
    def get_job_data(self):
        job = Job.objects.get(id=self.job_id)
        return {
            "id": str(job.id),
            "name": job.name,
            "status": job.status,
            "progress": job.progress,
        }
