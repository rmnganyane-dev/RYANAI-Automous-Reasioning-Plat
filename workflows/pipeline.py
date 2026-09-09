# File: workflows/pipeline.py
# Directory: workflows/
import asyncio

@app.task
async def run_pipeline(ctx: TaskContext, source: str, destination: str, config: dict):
    records = await ctx.run(extract, source)

    transformed = await asyncio.gather(
        *[ctx.run(transform, record, config) for record in records]
    )

    validated = await ctx.run(validate, transformed, config)

    return await ctx.run(load, validated, destination)

@app.task(retry=Retry(
    max_retries=3, wait_duration_ms=1000, backoff_scaling=2.0
))
def transform(_ctx: TaskContext, record: dict, config: dict):
    pass

@app.task
def extract(_ctx: TaskContext, source: str):
    pass

@app.task
def validate(_ctx: TaskContext, records: list[dict], config: dict):
    pass

@app.task
def load(_ctx: TaskContext, records: list[dict], destination: str):
    pass