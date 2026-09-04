from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.shortcuts import get_object_or_404


from .models import Job
from .tasks import run_job


def health(request):
    return JsonResponse({"status": "ok", "message": "JobPulse backend is alive!"})


@csrf_exempt
@require_http_methods(["POST"])
def create_job(request):
    """
    Purpose: create a new job and trigger celery to run async
    """

    try:
        body = json.loads(request.body)
        name = body.get("name", "No name provided")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    job = Job.objects.create(name=name)

    # Trigger celery
    run_job.delay(str(job.id))

    return JsonResponse(
        {
            "id": str(job.id),
            "name": job.name,
            "status": job.status,
            "progress": job.progress,
        },
        status=201,
    )


@require_http_methods(["GET"])
def get_job(request, job_id):
    # Fetch the job, or automatically return a 404 Not Found if it doesn't exist
    job = get_object_or_404(Job, id=job_id)

    return JsonResponse(
        {
            "id": str(job.id),
            "name": job.name,
            "status": job.status,
            "progress": job.progress,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
        }
    )
