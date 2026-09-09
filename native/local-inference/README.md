# Local Inference Bridge

This is a compileable C++17 bridge stub for offline inference. It provides a stable stdin/stdout contract and an optional `RYANAI_ENABLE_CUDA=ON` build switch, but it intentionally does not ship model weights or claim CUDA inference until signed kernels and weights are supplied.

```powershell
cmake -S native/local-inference -B native/local-inference/build
cmake --build native/local-inference/build --config Release
"hello" | native/local-inference/build/Release/ryanai-local-inference.exe
```