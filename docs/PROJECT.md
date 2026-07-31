# Project: ClearSight Tele-Ophthalmology Dashboard - IP Webcam Integration

## Architecture
- `dashboard/src/components/IpWebcamCapture.tsx`: New component handling HTTP JPEG stream polling, error states, capture logic, and user guide.
- `dashboard/src/pages/DashboardPage.tsx`: Modified page providing tabbed toggle between standard file upload and live mobile camera feed.

## Code Layout
- Frontend: React + TypeScript + Vite (`dashboard/`)
- Components: `dashboard/src/components/`
- Pages: `dashboard/src/pages/`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Exploration | Deep scan of `dashboard/src` code structure and types | none | DONE |
| 2 | M2: Implementation | Create `IpWebcamCapture.tsx` & update `DashboardPage.tsx` | M1 | DONE |
| 3 | M3: Review & Verification | Review code, test compilation, check UI specs | M2 | DONE |
| 4 | M4: Audit & Hardening | Forensic audit & adversarial check | M3 | DONE |

## Interface Contracts
### `IpWebcamCapture` Component Interface
```typescript
export interface IpWebcamCaptureProps {
  onCapture: (file: File) => void;
  defaultUrl?: string; // Default: "http://192.168.0.100:8080"
}
```
Outputs a `File` object named `webcam-capture.png` of MIME type `image/png`.
