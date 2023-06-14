import { Observable, filter } from 'rxjs';

// https://medium.com/ngconf/filtering-types-with-correct-type-inference-in-rxjs-f4edf064880d
export function inputIsNotNullOrUndefined<T>(
  input: null | undefined | T
): input is T {
  return input !== null && input !== undefined;
}

export function isNotNullOrUndefined<T>() {
  return (source$: Observable<null | undefined | T>) =>
    source$.pipe(filter(inputIsNotNullOrUndefined));
}
