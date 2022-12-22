export function signature(basis_file_path: string, sig_file_path: string): void;
export function delta(
  sig_file_path: string,
  new_file_path: string,
  delta_file_path: string
): void;
export function patch(
  basis_file_path: string,
  delta_file_path: string,
  new_file_path: string
): void;
export function signatureAsync(
  basis_file_path: string,
  sig_file_path: string
): Promise<void>;
export function deltaAsync(
  sig_file_path: string,
  new_file_path: string,
  delta_file_path: string
): Promise<void>;
export function patchAsync(
  basis_file_path: string,
  delta_file_path: string,
  new_file_path: string
): Promise<void>;
declare const rdiff: {
  signature;
  delta;
  patch;
  signatureAsync;
  deltaAsync;
  patchAsync;
};
export default rdiff;
