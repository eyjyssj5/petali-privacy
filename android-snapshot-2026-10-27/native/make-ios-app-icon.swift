// Genera icone iOS opache usando il logo floreale già presente nella versione Android.
// Usa soltanto AppKit: nessuna dipendenza esterna o download.
import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else {
    fputs("Uso: swift make-ios-app-icon.swift <sorgente.png> <AppIcon.appiconset>\n", stderr)
    exit(2)
}
let sourcePath = CommandLine.arguments[1]
let iconFolder = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let contentsURL = iconFolder.appendingPathComponent("Contents.json")
guard let source = NSImage(contentsOfFile: sourcePath),
      let data = try? Data(contentsOf: contentsURL),
      let catalog = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let images = catalog["images"] as? [[String: Any]] else {
    fputs("Logo o catalogo icone iOS non trovato.\n", stderr)
    exit(2)
}
// Alcuni template Capacitor generano il catalogo senza un filename.
// In quel caso configuriamo esplicitamente l'icona universale richiesta da iOS.
let iconEntries = images
if !images.contains(where: { ($0["filename"] as? String)?.isEmpty == false }) {
    iconEntries = [["idiom": "universal", "platform": "ios",
                    "size": "1024x1024", "filename": "AppIcon-512@2x.png"]]
    var newCatalog = catalog
    newCatalog["images"] = iconEntries
    let json = try JSONSerialization.data(withJSONObject: newCatalog, options: [.prettyPrinted, .sortedKeys])
    try json.write(to: contentsURL, options: .atomic)
}
var created = 0
for entry in iconEntries {
    guard let filename = entry["filename"] as? String, !filename.isEmpty else { continue }
    let sizeText = (entry["size"] as? String ?? "1024x1024").split(separator: "x")
    let points = Double(String(sizeText.first ?? "")) ?? 1024
    let scale = Double((entry["scale"] as? String ?? "1x").replacingOccurrences(of: "x", with: "")) ?? 1
    let pixels = max(16, Int((points * scale).rounded()))
    let side = CGFloat(pixels)
    let rect = NSRect(x: 0, y: 0, width: side, height: side)
    guard let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil,
                                       pixelsWide: pixels,
                                       pixelsHigh: pixels,
                                       bitsPerSample: 8,
                                       samplesPerPixel: 3,
                                       hasAlpha: false,
                                       isPlanar: false,
                                       colorSpaceName: .deviceRGB,
                                       bytesPerRow: 0,
                                       bitsPerPixel: 0),
          let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
        fputs("Impossibile creare l'icona iOS.\n", stderr)
        exit(2)
    }
    bitmap.size = NSSize(width: side, height: side)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    NSColor(calibratedRed: 0.99, green: 0.94, blue: 0.97, alpha: 1).setFill()
    NSBezierPath(rect: rect).fill()
    source.draw(in: rect, from: NSRect(origin: .zero, size: source.size), operation: .sourceOver, fraction: 1)
    context.flushGraphics()
    NSGraphicsContext.restoreGraphicsState()
    guard let png = bitmap.representation(using: .png, properties: [:]) else {
        fputs("Impossibile esportare icona PNG.\n", stderr)
        exit(2)
    }
    try png.write(to: iconFolder.appendingPathComponent(filename), options: .atomic)
    created += 1
    print("PETALI: icona iOS \(filename) (\(pixels)x\(pixels), opaca).")
}
guard created > 0 else {
    fputs("Nessuna immagine configurata nel catalogo AppIcon.appiconset.\n", stderr)
    exit(2)
}
