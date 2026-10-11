// Offline tutor answer used when the AI backend is unavailable or not configured.
// Pure function: shared by the browser app and the Cloudflare Worker.

export function tutorFallbackAnswer(question: string, language: string = 'en'): string {
  const q = question.slice(0, 500);
  if (language === 'bn') {
    return `### 💡 পদার্থবিজ্ঞান ধারণা ও ব্যাখ্যা (Physics Concept Guide)

**প্রশ্ন:** "${q}"

1. **মূল নীতি (Fundamental Principle):**
   পদার্থবিজ্ঞানের সমস্যা সমাধানে সর্বপ্রথম প্রদত্ত রাশিগুলো ($m, u, v, s, t, F, a$) এসআই (SI) এককে রূপান্তর করা আবশ্যক।

2. **প্রয়োজনীয় সূত্রাবলি (Key Formulas in LaTeX):**
   - একমাত্রিক গতি: $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
   - নিউটনের গতির ২য় সূত্র: $F_{net} = ma$
   - ঘর্ষণ বল: $f_k = \\mu_k N = \\mu_k mg$ (সমতলে)
   - কাজ ও শক্তি: $W = Fd\\cos\\theta$, $E_k = \\frac{1}{2}mv^2$, $E_p = mgh$
   - ক্ষমতা: $P = \\frac{W}{t} = Fv$

3. **অনুশীলন টিপস:**
   - সর্বদা বস্তুর উপর ক্রিয়াশীল বলগুলোর একটি **মুক্ত বস্তু চিত্র (Free Body Diagram)** আঁকুন।
   - কোণ থাকলে বল বা বেগকে অনুভূমিক ($F\\cos\\theta$) ও উল্লম্ব ($F\\sin\\theta$) উপাংশে ভাগ করুন।`;
  }
  return `### 💡 High School Physics Tutor Insights

**Your Question:** "${q}"

1. **Core Physics Strategy:**
   Always begin by listing your knowns with standardized SI units ($m, u, v, s, t, F, a$), identifying target unknowns, and choosing the appropriate conservation law or kinematic equation.

2. **Essential Formulas (LaTeX):**
   - **Constant Acceleration Motion:** $v = u + at$, $s = ut + \\frac{1}{2}at^2$, $v^2 = u^2 + 2as$
   - **Dynamics & Newton's 2nd Law:** $\\Sigma F = ma$, Friction $f_k = \\mu_k N$
   - **Work & Mechanical Energy:** $W = Fd\\cos\\theta$, $E_k = \\frac{1}{2}mv^2$, $E_p = mgh$
   - **Power:** $P = \\frac{W}{t} = F v$

3. **Key Problem-Solving Check:**
   - Draw a Free Body Diagram (FBD) for all force components.
   - Separate horizontal motion (constant velocity) from vertical motion (accelerated by gravity $g = 9.8\\text{ m/s}^2$).`;
}
