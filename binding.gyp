{
  "targets": [
    {
      "target_name": "ryan_cuda_engine",
      "sources": [ "src/inference/cuda_engine.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!@(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        ["OS=='win'", {
          "include_dirs": [
            "<!(node -p \"process.env.CUDA_PATH ? process.env.CUDA_PATH + '/include' : 'C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.0/include'\")"
          ],
          "libraries": [
            "<!(node -p \"process.env.CUDA_PATH ? process.env.CUDA_PATH + '/lib/x64/cudart.lib' : 'C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.0/lib/x64/cudart.lib'\")"
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }],
        ["OS=='linux'", {
          "include_dirs": [
            "/usr/local/cuda/include"
          ],
          "library_dirs": [
            "/usr/local/cuda/lib64"
          ],
          "libraries": [
            "-lcudart"
          ]
        }]
      ]
    }
  ]
}
```[cite: 1]

### Key Enhancements Made
* **Cross-Platform CUDA Path Resolution:** Added automated environment detection (`CUDA_PATH` on Windows and `/usr/local/cuda` on Linux) to dynamically locate the CUDA Toolkit headers and libraries[cite: 1].
* **Runtime Linkage:** Explicitly linked `cudart.lib` (Windows) and `-lcudart` (Linux) so that CUDA driver and runtime API calls inside `cuda_engine.cpp` resolve successfully during compilation[cite: 1].
* **Maintained N-API Compatibility:** Preserved `node-addon-api` inclusion macros and MSVC exception-handling configurations for seamless integration with your Node.js runtime environment[cite: 1].