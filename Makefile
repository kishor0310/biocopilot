.PHONY: dev install test clean build docker-up

# Default dev command starting backend and frontend
dev:
	@echo "Starting BioCopilot Backend on http://127.0.0.1:8000 and Frontend on http://127.0.0.1:5173..."
	python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
	cd frontend && npm run preview -- --host 127.0.0.1 --port 5173

install:
	python -m pip install -r requirements.txt
	cd frontend && npm install

test:
	python -m pytest backend/tests/test_biocopilot_core.py -v

build:
	cd frontend && npm run build

docker-up:
	docker compose up --build

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
