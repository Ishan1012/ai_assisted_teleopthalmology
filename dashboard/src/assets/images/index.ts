import sample1 from './sample_fundus_1.jpg'
import sample2 from './sample_fundus_2.jpg'
import sample3 from './sample_fundus_3.jpg'
import sample4 from './sample_fundus_4.jpg'

import confusionMatrix from './confusion_matrix.png'
import flowChart1 from './flow_chart.png'
import flowChart2 from './flow_chart2.jpg'
import flowChart3 from './flow_chart3.png'
import groupedBar from './grouped_bar.png'

import plot14 from './plot14.png'
import plot15 from './plot15.png'
import plot16 from './plot16.png'
import plot17 from './plot17.png'
import plot18 from './plot18.png'
import plot19 from './plot19.png'

import prCurve from './pr_curve.png'
import radarMultiNetANFIS from './radar_MultiNet_ANFIS.png'
import radarChart from './radar_chart.png'
import radarDenseNet from './radar_densenet121.png'
import radarMobileNet from './radar_mobilenet.png'
import radarResNet from './radar_resnet18.png'
import rocComparison from './roc_comparison.png'
import testPrediction from './test_prediction.png'

export interface SampleFundusImage {
  id: string
  name: string
  dataset: string
  diagnosis: 'Glaucoma Indicated' | 'Normal / Control'
  description: string
  url: string
  filename: string
}

export const SAMPLE_FUNDUS_IMAGES: SampleFundusImage[] = [
  {
    id: 'fundus-sample-1',
    name: 'Fundus Scan #1',
    dataset: 'ACRIMA Clinical Dataset',
    diagnosis: 'Glaucoma Indicated',
    description: 'Deep vertical cup-to-disc ratio enlargement with neuroretinal rim thinning.',
    url: sample1,
    filename: 'sample_fundus_1.jpg',
  },
  {
    id: 'fundus-sample-2',
    name: 'Fundus Scan #2',
    dataset: 'ACRIMA Clinical Dataset',
    diagnosis: 'Glaucoma Indicated',
    description: 'Elevated cup-to-disc ratio with marked vascular nasal bending.',
    url: sample2,
    filename: 'sample_fundus_2.jpg',
  },
  {
    id: 'fundus-sample-3',
    name: 'Fundus Scan #3',
    dataset: 'Drishti-GS Benchmark',
    diagnosis: 'Glaucoma Indicated',
    description: 'Optic nerve head cupping with temporal neuroretinal rim loss.',
    url: sample3,
    filename: 'sample_fundus_3.jpg',
  },
  {
    id: 'fundus-sample-4',
    name: 'Fundus Scan #4',
    dataset: 'Drishti-GS Benchmark',
    diagnosis: 'Glaucoma Indicated',
    description: 'Significant neuroretinal rim notch and pathological optic disc cupping.',
    url: sample4,
    filename: 'sample_fundus_4.jpg',
  },
]

export const RESEARCH_IMAGES = {
  flowChart1,
  flowChart2,
  flowChart3,
  confusionMatrix,
  rocComparison,
  prCurve,
  groupedBar,
  radarMultiNetANFIS,
  radarChart,
  radarDenseNet,
  radarMobileNet,
  radarResNet,
  testPrediction,
  trainingPlots: [plot14, plot15, plot16, plot17, plot18, plot19],
}

/**
 * Utility to fetch a sample image asset URL and convert it into a standard File object for uploading.
 */
export async function sampleImageToFile(sample: SampleFundusImage): Promise<File> {
  const response = await fetch(sample.url)
  const blob = await response.blob()
  return new File([blob], sample.filename, { type: blob.type || 'image/png' })
}
