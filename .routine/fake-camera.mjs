// Counter-scanner capture support.
//
// The dashboard's Scan button (components/dashboard/qr-scanner.tsx in the app
// repo) opens a camera dialog and decodes whatever QR it sees. Headless
// Chromium in this sandbox exposes no camera at all, so getUserMedia fails and
// the dialog only ever renders its "could not start the camera" fallback.
//
// This installs a canvas-backed video track carrying a REAL QR code, so the
// page runs its real decode path against a real code. Only the camera hardware
// is simulated; the scan, the lookup, and everything after it are genuine.
//
// aim:
//   "locked"  - QR centred, decodes immediately (use for the result screens)
//   "partial" - QR pushed to the frame edge so it does not decode, which is
//               what the viewfinder looks like while staff line the code up
//               (use for the dialog screenshot itself)
//
// Requires the `qrcode` package (only for flows that ask for a fake camera).

// qrPx sizes the code inside the 640x480 frame. A narrow viewport shrinks the
// dialog's scan window, so mobile flows need a smaller code to land inside it.
export async function installFakeCamera(context, { qr, aim = 'locked', qrPx = 340 }) {
  const { default: QRCode } = await import('qrcode');
  const encoded = QRCode.create(qr, { errorCorrectionLevel: 'M' });

  await context.addInitScript(
    ({ size, data, aim, qrPx }) => {
      const W = 640;
      const H = 480;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const quiet = 4;
      const total = size + quiet * 2;
      const scale = Math.max(2, Math.floor(qrPx / total));
      const box = total * scale;
      const ox = aim === 'partial' ? Math.round(W * 0.06) : Math.round((W - box) / 2);
      const oy = aim === 'partial' ? Math.round(H - box * 0.62) : Math.round((H - box) / 2);

      function draw() {
        ctx.fillStyle = '#c9c6c2';               // counter surface behind the phone
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffffff';               // the customer's screen
        ctx.fillRect(ox - 18, oy - 18, box + 36, box + 36);
        ctx.fillStyle = '#111111';
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (!data[r * size + c]) continue;
            ctx.fillRect(ox + (c + quiet) * scale, oy + (r + quiet) * scale, scale, scale);
          }
        }
        requestAnimationFrame(draw);
      }
      draw();

      const stream = canvas.captureStream(15);
      const media = navigator.mediaDevices || {};
      media.getUserMedia = async () => stream;
      media.enumerateDevices = async () => [
        { kind: 'videoinput', deviceId: 'qtap-counter-cam', label: 'Counter camera', groupId: 'counter' },
      ];
      Object.defineProperty(navigator, 'mediaDevices', { value: media, configurable: true });
    },
    { size: encoded.modules.size, data: Array.from(encoded.modules.data).map(Number), aim, qrPx },
  );
}
