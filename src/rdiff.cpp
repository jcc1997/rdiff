#include "librsync.h"
#include "rdiff.h"

using namespace std;

char *rs_hash_name;
char *rs_rollsum_name;

static int block_len = 0;
static int strong_len = 0;

static int file_force = 0;
static int show_stats = 0;

static rs_result rdiff_sig(char const *basis_file_name, char const *sig_file_name)
{
    FILE *basis_file, *sig_file;
    rs_stats_t stats;
    rs_result result;
    rs_magic_number sig_magic;

    basis_file = rs_file_open(basis_file_name, "rb", file_force);
    sig_file = rs_file_open(sig_file_name, "wb", file_force);

    if (!rs_hash_name || !strcmp(rs_hash_name, "blake2"))
    {
        sig_magic = RS_BLAKE2_SIG_MAGIC;
    }
    else if (!strcmp(rs_hash_name, "md4"))
    {
        sig_magic = RS_MD4_SIG_MAGIC;
    }
    else
    {
        exit(RS_SYNTAX_ERROR);
    }
    if (!rs_rollsum_name || !strcmp(rs_rollsum_name, "rabinkarp"))
    {
        /* The RabinKarp magics are 0x10 greater than the rollsum magics. */
        (*(unsigned *)&sig_magic) += 0x10;
        // sig_magic += 0x10;
    }
    else if (strcmp(rs_rollsum_name, "rollsum"))
    {
        exit(RS_SYNTAX_ERROR);
    }

    result =
        rs_sig_file(basis_file, sig_file, block_len, strong_len, sig_magic,
                    &stats);

    rs_file_close(sig_file);
    rs_file_close(basis_file);
    if (result != RS_DONE)
        return result;

    if (show_stats)
        rs_log_stats(&stats);

    return result;
}

static rs_result rdiff_delta(char const *sig_file_name, char const *new_file_name, char const *delta_file_name)
{
    FILE *sig_file, *new_file, *delta_file;
    rs_result result;
    rs_signature_t *sumset;
    rs_stats_t stats;

    sig_file = rs_file_open(sig_file_name, "rb", file_force);
    new_file = rs_file_open(new_file_name, "rb", file_force);
    delta_file = rs_file_open(delta_file_name, "wb", file_force);

    result = rs_loadsig_file(sig_file, &sumset, &stats);
    if (result != RS_DONE)
        return result;

    if (show_stats)
        rs_log_stats(&stats);

    if ((result = rs_build_hash_table(sumset)) != RS_DONE)
        return result;

    result = rs_delta_file(sumset, new_file, delta_file, &stats);

    rs_file_close(delta_file);
    rs_file_close(new_file);
    rs_file_close(sig_file);

    if (show_stats)
    {
        rs_signature_log_stats(sumset);
        rs_log_stats(&stats);
    }

    rs_free_sumset(sumset);

    return result;
}

static rs_result rdiff_patch(char const *basis_file_name, char const *delta_file_name, char const *new_file_name)
{
    /* patch BASIS [DELTA [NEWFILE]] */
    FILE *basis_file, *delta_file, *new_file;
    rs_stats_t stats;
    rs_result result;

    basis_file = rs_file_open(basis_file_name, "rb", file_force);
    delta_file = rs_file_open(delta_file_name, "rb", file_force);
    new_file = rs_file_open(new_file_name, "wb", file_force);

    result = rs_patch_file(basis_file, delta_file, new_file, &stats);

    rs_file_close(new_file);
    rs_file_close(delta_file);
    rs_file_close(basis_file);

    if (show_stats)
        rs_log_stats(&stats);

    return result;
}

Napi::Boolean signature_warp(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    // check if arguments are integer only.
    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString())
    {
        Napi::TypeError::New(env, "arg1::String, arg2::String expected").ThrowAsJavaScriptException();
    }
    // convert javascripts datatype to c++
    Napi::String basis_file_name = info[0].As<Napi::String>();
    Napi::String sig_file_name = info[1].As<Napi::String>();
    // run c++ function return value and return it in javascript
    rs_result result = rdiff_sig(basis_file_name.Utf8Value().c_str(), sig_file_name.Utf8Value().c_str());
    Napi::Boolean returnValue = Napi::Boolean::New(env, result == 0);

    return returnValue;
}

Napi::Boolean delta_warp(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    // check if arguments are integer only.
    if (info.Length() < 3 || !info[0].IsString() || !info[1].IsString() || !info[2].IsString())
    {
        Napi::TypeError::New(env, "arg1::String, arg2::String, arg3::String expected").ThrowAsJavaScriptException();
    }
    // convert javascripts datatype to c++
    Napi::String sig_file_name = info[0].As<Napi::String>();
    Napi::String new_file_name = info[1].As<Napi::String>();
    Napi::String delta_file_name = info[2].As<Napi::String>();
    // run c++ function return value and return it in javascript
    rs_result result = rdiff_delta(sig_file_name.Utf8Value().c_str(), new_file_name.Utf8Value().c_str(), delta_file_name.Utf8Value().c_str());
    Napi::Boolean returnValue = Napi::Boolean::New(env, result == 0);

    return returnValue;
}

Napi::Boolean patch_warp(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    // check if arguments are integer only.
    if (info.Length() < 3 || !info[0].IsString() || !info[1].IsString() || !info[2].IsString())
    {
        Napi::TypeError::New(env, "arg1::String, arg2::String, arg3::String expected").ThrowAsJavaScriptException();
    }
    // convert javascripts datatype to c++
    Napi::String basis_file_name = info[0].As<Napi::String>();
    Napi::String delta_file_name = info[1].As<Napi::String>();
    Napi::String new_file_name = info[2].As<Napi::String>();
    // run c++ function return value and return it in javascript
    rs_result result = rdiff_patch(basis_file_name.Utf8Value().c_str(), delta_file_name.Utf8Value().c_str(), new_file_name.Utf8Value().c_str());
    Napi::Boolean returnValue = Napi::Boolean::New(env, result == 0);

    return returnValue;
}

Napi::Object rdiff::Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("signature", Napi::Function::New(env, signature_warp));
    exports.Set("delta", Napi::Function::New(env, delta_warp));
    exports.Set("patch", Napi::Function::New(env, patch_warp));
    return exports;
}