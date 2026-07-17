import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays invocation', () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 200);
    debounced('a');
    debounced('b');
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('b');
  });
});
