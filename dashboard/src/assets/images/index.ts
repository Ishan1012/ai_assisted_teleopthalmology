import im094 from './Im094_ACRIMAfe.png'
import im177 from './Im177_ACRIMAfe.png'
import im393 from './Im393_g_ACRIMAfe.png'
import drishti015 from './drishtiGS_015fe.png'

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
    id: 'acrima-094',
    name: 'ACRIMA Sample #094',
    dataset: 'ACRIMA Clinical Dataset',
    diagnosis: 'Glaucoma Indicated',
    description: 'Optic cup enlargement with significant neuroretinal rim thinning.',
    url: im094,
    filename: 'Im094_ACRIMAfe.png',
  },
  {
    id: 'acrima-177',
    name: 'ACRIMA Sample #177',
    dataset: 'ACRIMA Clinical Dataset',
    diagnosis: 'Glaucoma Indicated',
    description: 'Pathological glaucomatous damage with vertical optic disc cupping.',
    url: im177,
    filename: 'Im177_ACRIMAfe.png',
  },
  {
    id: 'acrima-393',
    name: 'ACRIMA Sample #393',
    dataset: 'ACRIMA Clinical Dataset',
    diagnosis: 'Normal / Control',
    description: 'Healthy neuroretinal rim structure with normal cup-to-disc ratio.',
    url: im393,
    filename: 'Im393_g_ACRIMAfe.png',
  },
  {
    id: 'drishti-015',
    name: 'Drishti-GS Sample #015',
    dataset: 'Drishti-GS Benchmark',
    diagnosis: 'Glaucoma Indicated',
    description: 'Standardized optic nerve head scan from Drishti-GS dataset.',
    url: drishti015,
    filename: 'drishtiGS_015fe.png',
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
