export function signature(basis_file_path: string, sig_file_path: string);
export function delta(sig_file_path: string, new_file_path: string, delta_file_path: string);
export function patch(basis_file_path: string, delta_file_path: string, new_file_path: string);
declare const rdiff: {
    signature,
    delta,
    patch,
}
export default rdiff;
