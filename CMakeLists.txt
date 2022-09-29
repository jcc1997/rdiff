cmake_minimum_required(VERSION 3.15)

# Name of the project (will be the name of the plugin)
project(rdiff)
set(CMAKE_CXX_STANDARD 17)

# Don't add this line if you will try_compile with boost.
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Essential include files to build a node addon,
# you should add this line in every CMake.js based project.
include_directories(${CMAKE_JS_INC})

# rsync
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/librsync)
set(rsync_SRCS
    src/librsync/prototab.c
    src/librsync/base64.c
    src/librsync/buf.c
    src/librsync/checksum.c
    src/librsync/command.c
    src/librsync/delta.c
    src/librsync/emit.c
    src/librsync/fileutil.c
    src/librsync/hashtable.c
    src/librsync/hex.c
    src/librsync/job.c
    src/librsync/mdfour.c
    src/librsync/mksum.c
    src/librsync/msg.c
    src/librsync/netint.c
    src/librsync/patch.c
    src/librsync/readsums.c
    src/librsync/rollsum.c
    src/librsync/rabinkarp.c
    src/librsync/scoop.c
    src/librsync/stats.c
    src/librsync/sumset.c
    src/librsync/trace.c
    src/librsync/tube.c
    src/librsync/util.c
    src/librsync/version.c
    src/librsync/whole.c)

# blake2
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/librsync/blake2)
set(blake2_SRCS src/librsync/blake2/blake2b-ref.c)

# Declare the location of the source files
file(GLOB SOURCE_FILES "src/*.cpp" "src/*.h")

# This line will tell CMake that we're building a shared library
# from the above source files
# named after the project's name
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC} ${rsync_SRCS} ${blake2_SRCS})

# This line will give our library file a .node extension without any "lib" prefix
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

# Essential library files to link to a node addon,
# you should add this line in every CMake.js based project.
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB} ${LIBRSYNC_LIB_DIR})

# Include N-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
)
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})
add_definitions(-DNAPI_VERSION=3)