{
  "targets": [
    {
      "target_name": "ryan_cuda_engine",
      "sources": [ "src/inference/cuda_engine.cpp" ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include.replaceAll('\\\\', '/')\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp.replaceAll('\\\\', '/')\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "conditions": [
        ["OS=='win'", {
          "include_dirs": [
            "<!(node -p \"(process.env.CUDA_PATH ? process.env.CUDA_PATH + '/include' : 'C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.0/include').replaceAll('\\\\', '/')\")"
          ],
          "libraries": [
            "<!(node -p \"(process.env.CUDA_PATH ? process.env.CUDA_PATH + '/lib/x64/cudart.lib' : 'C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v12.0/lib/x64/cudart.lib').replaceAll('\\\\', '/')\")"
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
