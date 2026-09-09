# File: workflows/analyze.ts
// Directory: workflows/
const analyze = task({ name: 'analyze' },
  async (ctx: TaskContext, fileUrls: string[], criteria: object) => {
    const results = await Promise.all(
      fileUrls.map((url) => ctx.run(analyzeOne, url, criteria))
    )
    return await ctx.run(report, results, criteria)
  }
)

const analyzeOne = task({ name: 'analyzeOne' }, async (ctx: TaskContext, url: string, criteria: object) => {
  // Process single file instance
})

const report = task({ name: 'report' }, async (ctx: TaskContext, results: any[], criteria: object) => {
  // Aggregate results report
})