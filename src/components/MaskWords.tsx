/**
 * Splits a heading into words, each inside its own clipping window, so Motion can raise the
 * words up from behind a clean cut line, one beat apart (a masked-type reveal, not a fade).
 * Rendered on the server: the text is complete and readable without JS or with reduced motion.
 */
export function MaskWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        /^\s+$/.test(part) || !part ? (
          part
        ) : (
          <span key={i} className="mask-w">
            <span data-mask-word className="mask-wi">{part}</span>
          </span>
        ),
      )}
    </>
  );
}
