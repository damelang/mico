/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

#include <string.h>
#include <stdlib.h>
#include <dlfcn.h>
#include "jsapi.h"

#define HEAP_SIZE_LIMIT  (8 * 1024 * 1024)
#define STACK_CHUNK_SIZE (8192)
#define NCALLBACKS_BEFORE_WE_MAYBEGC (1000)

#define DIE(s, ...) \
do { \
    fprintf (stderr, "(%s:%4d) " s "\n", __FILE__, __LINE__, ##__VA_ARGS__); \
    exit (1); \
} while (0)

#define ERROR_CHECK(f) \
    if (!(f)) DIE ("JS engine error")

static JSBool
branch_callback (JSContext *context, JSScript *script)
{
    static int ncallbacks;

    if (ncallbacks == NCALLBACKS_BEFORE_WE_MAYBEGC) {
        JS_MaybeGC (context);
        ncallbacks = 0;
    }
    else
        ncallbacks++;

    return JS_TRUE;
}

static void
error_reporter (JSContext *context, const char *message, JSErrorReport *report)
{
    fprintf (stderr, "%s:%u:%s\n",
             report->filename ? report->filename : "<no filename>",
             (unsigned int) report->lineno, message);

    exit (1);
}

static JSBool
system_open (JSContext *context, JSObject *object,
             uintN argc, jsval *argv, jsval *rval)
{
    /* TODO */
    return JS_TRUE;
}

/* TODO replace this (or implement it in JS) with system.open(1, ) */
static JSBool
system_print (JSContext *context, JSObject *object,
              uintN argc, jsval *argv, jsval *rval)
{
    JSString *string;
    
    if (!(string = JS_ValueToString (context, argv[0])))
        return JS_FALSE;
    printf ("%s\n", JS_GetStringBytes (string));

    return JS_TRUE;
}

static JSBool
system_dlload (JSContext *context, JSObject *object,
               uintN argc, jsval *argv, jsval *rval)
{
    void *library;
    char *filename, *filename_with_ext;
    void (*initialize) (JSContext *context);
    JSString *string;
    unsigned int i;

    for (i = 0; i < argc; i++) {
        string = JS_ValueToString (context, argv[i]);
        if (!string)
            return JS_FALSE;
        filename = JS_GetStringBytes (string);
        filename_with_ext = (char *) malloc (strlen (filename) +
                                             strlen (COMPILED_PACKAGE_EXT) + 1);
        sprintf (filename_with_ext, "%s%s", filename, COMPILED_PACKAGE_EXT);

        /* TODO don't even try if file doesn't exist */
        library = dlopen (filename_with_ext, RTLD_LAZY | RTLD_GLOBAL);
        if (!library) {
            //printf ("dlopen error: %s\n", dlerror ());
            free (filename_with_ext);
            *rval = JSVAL_NULL;
            return JS_TRUE;
        }
        free (filename_with_ext);

        initialize = (void (*) (JSContext *)) dlsym (library, "initialize");
        if (!initialize) {
            *rval = JSVAL_NULL;
            return JS_TRUE;
        }

        initialize (context);
    }

    *rval = JSVAL_TRUE;
    return JS_TRUE;
}

static JSBool
system_load (JSContext *context, JSObject *object,
             uintN argc, jsval *argv, jsval *rval)
{
    JSScript *script;
    jsval val;
    JSObject *global;
    JSString *string;
    char *filename;
    FILE *f;
    unsigned int i;

    *rval = JSVAL_TRUE;
    global = JS_GetGlobalObject (context);

    for (i = 0; i < argc; i++) {
        string = JS_ValueToString (context, argv[i]);
        if (!string)
            return JS_FALSE;
        filename = JS_GetStringBytes (string);
        
        f = fopen (filename, "r");
        if (!f) {
            *rval = JSVAL_FALSE;
            break;
        }
        fclose (f);

        if (!(script = JS_CompileFile (context, global, filename))) {
            if (JS_IsExceptionPending (context)) {
                JS_ReportPendingException (context);
                /*
                jsval val;
                JS_GetPendingException (context, &val);
                JS_ThrowReportedError (context, "system.load failed",
                    JS_ErrorFromException (context, val));
                */
            }
            *rval = JSVAL_FALSE;
            break; 
        }
        if (!JS_ExecuteScript (context, global, script, &val) &&
            JS_IsExceptionPending (context))
            JS_ReportPendingException (context);
        JS_DestroyScript (context, script);
    }

    return JS_TRUE;
}

int
main (int argc, const char *argv[])
{
    JSRuntime *runtime;
    JSContext *context;
    JSObject  *global, *system;
    JSScript *script;
    jsval val;

    JSClass global_class = {
        "global", JSCLASS_GLOBAL_FLAGS,
        JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
        JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
        JSCLASS_NO_OPTIONAL_MEMBERS
    };

    JSFunctionSpec system_functions[] = {
        {"print",  system_print,  1, 0, 0},
        {"open",   system_open,   2, 0, 0},
        {"dlload", system_dlload, 1, 0, 0},
        {"load",   system_load,   1, 0, 0},
        {NULL, NULL, 0, 0, 0}
    };

    ERROR_CHECK (runtime = JS_NewRuntime (HEAP_SIZE_LIMIT));
    ERROR_CHECK (context = JS_NewContext (runtime, STACK_CHUNK_SIZE));
    JS_SetOptions (context, JSOPTION_VAROBJFIX);
#ifdef JSOPTION_JIT
    JS_SetOptions (context, JSOPTION_JIT);
#endif
    ERROR_CHECK (global = JS_NewObject (context, &global_class, NULL, NULL));
    ERROR_CHECK (JS_InitStandardClasses (context, global));
    ERROR_CHECK (system = JS_DefineObject (context, global, "system",
                                           NULL, NULL, 0));
    val = STRING_TO_JSVAL (JS_NewStringCopyZ (context, "spidermonkey"));
    ERROR_CHECK (JS_SetProperty (context, system, "engine", &val));
    ERROR_CHECK (JS_DefineFunctions (context, system, system_functions));

    JS_SetErrorReporter (context, error_reporter);
    JS_SetBranchCallback (context, branch_callback);
    if (argc > 1) {
        ERROR_CHECK (script = JS_CompileFile (context, global, argv[1]));
        ERROR_CHECK (JS_ExecuteScript (context, global, script, &val));
        JS_DestroyScript (context, script);
    }

    JS_DestroyContext (context);
    JS_DestroyRuntime (runtime);
    JS_ShutDown ();

    return 0;
}
