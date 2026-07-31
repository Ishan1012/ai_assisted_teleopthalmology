
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <img src="/mascot.png" alt="ClearSight Logo" className="w-5 h-5 object-contain" />
          <span className="font-semibold text-neutral-900">ClearSight</span>
          <span>— Research Tele-Ophthalmology AI</span>
        </div>
        <p>CNN Ensemble + ANFIS Glaucoma Detection Paper Demonstration</p>
      </div>
    </footer>
  )
}
