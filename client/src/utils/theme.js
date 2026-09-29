/**
 * CivicPath Theme & View Transitions Management
 * 
 * Provides:
 * 1. Persistent light/dark theme state across browser reloads via localStorage
 * 2. Theme Toggle Effect (Chánh Đại Circle Blur reference) using document.startViewTransition
 * 3. Graceful fallback for browsers without View Transitions API
 * 4. prefers-reduced-motion accessibility compliance
 * 5. Lightweight view/page transition wrapper for application states
 */

export const THEME_STORAGE_KEY = 'civicpath_theme';

/**
 * Retrieves the initial theme from localStorage or system preference
 * @returns {'dark' | 'light'}
 */
export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (err) {
    console.warn('[Theme] Error reading saved theme, falling back to dark:', err);
  }
  return 'dark'; // Default to CivicPath dark theme
}

/**
 * Applies the given theme class and data-theme attribute to document.documentElement
 * @param {'dark' | 'light'} theme 
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('[Theme] Error saving theme to localStorage:', err);
  }
}

/**
 * Executes a circular ripple Theme Toggle Effect based on Chánh Đại's implementation
 * @param {'dark' | 'light'} currentTheme 
 * @param {(nextTheme: 'dark' | 'light') => void} onThemeChange 
 * @param {MouseEvent | React.MouseEvent} [event] 
 */
export function toggleThemeWithEffect(currentTheme, onThemeChange, event) {
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Check for reduced motion or lack of View Transitions API support
  const isReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const supportsViewTransitions = typeof document !== 'undefined' && 
    typeof document.startViewTransition === 'function';

  // Fallback: If not supported or reduced motion requested, apply immediately
  if (!supportsViewTransitions || isReducedMotion) {
    applyTheme(nextTheme);
    if (onThemeChange) onThemeChange(nextTheme);
    return;
  }

  // Calculate pointer origin coordinates for the circular expansion
  let x = window.innerWidth - 40;
  let y = 30;

  if (event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    x = event.clientX;
    y = event.clientY;
  }

  // Calculate the maximum radius needed to cover all 4 screen corners
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.classList.add('theme-transitioning');

  const transition = document.startViewTransition(() => {
    applyTheme(nextTheme);
    if (onThemeChange) onThemeChange(nextTheme);
  });

  transition.ready
    .then(() => {
      // Animate the incoming theme view with circular clip-path reveal
      const animation = document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );

      animation.finished.finally(() => {
        document.documentElement.classList.remove('theme-transitioning');
      });
    })
    .catch((err) => {
      console.warn('[Theme] View transition failed, falling back:', err);
      document.documentElement.classList.remove('theme-transitioning');
    });
}

/**
 * Lightweight helper for page/modal state transitions
 * @param {() => void} updateFn 
 */
export function transitionView(updateFn) {
  if (typeof updateFn !== 'function') return;

  const isReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const supportsViewTransitions = typeof document !== 'undefined' && 
    typeof document.startViewTransition === 'function';

  if (!supportsViewTransitions || isReducedMotion) {
    updateFn();
    return;
  }

  document.documentElement.classList.add('page-transitioning');
  const transition = document.startViewTransition(updateFn);

  transition.finished.finally(() => {
    document.documentElement.classList.remove('page-transitioning');
  });
}
