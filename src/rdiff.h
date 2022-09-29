#include <napi.h>
#include <iostream>

using namespace std;

namespace rdiff
{
    // Export API
    Napi::Object Init(Napi::Env env, Napi::Object exports);
    NODE_API_MODULE(addon, Init)
}