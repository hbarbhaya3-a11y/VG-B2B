import { useMemo } from 'react'
import { useUseCase } from '../contexts/UseCaseContext'
import { STAGE_TO_BUCKET, WORKFLOW_BUCKET_ORDER } from '../theme'

export function useWorkflowNav() {
  const { activeUseCase, stepIndex, goToStep } = useUseCase()
  const isWorkflowActive = !!activeUseCase
  const steps = activeUseCase?.steps || []

  const activeBucket = useMemo(() => {
    const step = steps[stepIndex]
    if (!step) return null
    return STAGE_TO_BUCKET[step.stage] || null
  }, [steps, stepIndex])

  const { completedBuckets, futureBuckets, lockedBuckets, bucketStepRanges } = useMemo(() => {
    const ranges = {}
    steps.forEach((step, i) => {
      const bucket = STAGE_TO_BUCKET[step.stage] || 'execute'
      if (!ranges[bucket]) ranges[bucket] = { start: i, end: i }
      ranges[bucket].end = i
    })

    const activeBucketIdx = activeBucket ? WORKFLOW_BUCKET_ORDER.indexOf(activeBucket) : -1
    const completed = []
    const future = []
    const locked = []

    WORKFLOW_BUCKET_ORDER.forEach((b, idx) => {
      if (!ranges[b]) return
      if (idx < activeBucketIdx) completed.push(b)
      else if (idx > activeBucketIdx) future.push(b)
    })

    return { completedBuckets: completed, futureBuckets: future, lockedBuckets: locked, bucketStepRanges: ranges }
  }, [steps, activeBucket])

  const jumpToBucket = (bucketId) => {
    const range = bucketStepRanges[bucketId]
    if (range) goToStep(range.start)
  }

  return {
    isWorkflowActive,
    activeBucket,
    completedBuckets,
    futureBuckets,
    lockedBuckets,
    bucketStepRanges,
    jumpToBucket,
  }
}
