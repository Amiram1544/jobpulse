import time
from celery import shared_task

from .models import Job


@shared_task(bind=True, acks_late=True)
def run_job(self, job_id):
    print(f"[Celery Worker] Starting task for Job ID: {job_id}")

    try:
        job = Job.objects.get(id=job_id)

        job.status = Job.Status.RUNNING
        job.save()

        total_steps = 10
        for step in range(1, total_steps + 1):
            print(f"[Celery Worker] Processing {job.name}... Step {step}/{total_steps}")

            # time.sleep() simulates a slow process (like generating a PDF or calling an API)
            time.sleep(1)

            # Update progress in the database
            job.progress = int((step / total_steps) * 100)
            job.save()

        job.status = Job.Status.DONE
        job.progress = 100
        job.save()
        print(f"[Celery Worker] Job {job_id} completed successfully!")

    except Exception as e:
        print(f"[Celery Worker] Job {job_id} FAILED: {str(e)}")
        job.status = Job.Status.FAILED
        job.save()
