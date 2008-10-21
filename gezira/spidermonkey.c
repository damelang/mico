/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

#include <stdlib.h>
#include "jsapi.h"
#include "gezira-pixmap.h"

// PixmapPainter

static JSBool
pixmap_painter_class_constructor (JSContext *context, JSObject *object,
                                  uintN argc, jsval *argv, jsval *rval)
{
    gezira_pixmap_painter_t *painter;
    double d;

    painter = (gezira_pixmap_painter_t *) malloc (sizeof (*painter));
    JS_SetPrivate (context, object, painter);
    painter->table = gezira_pixmap_dispatch_table;
    /* FIXME hackety hack hack */
    JS_ValueToNumber (context, argv[0], &d);
    painter->pixmap.pixels = *((char **) (char *) &d);
    painter->pixmap.width = JSVAL_TO_INT (argv[1]);
    painter->pixmap.height = JSVAL_TO_INT (argv[2]);
    painter->pixmap.bytes_per_pixel = JSVAL_TO_INT (argv[3]);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
pixmap_painter_class_paint (JSContext *context, JSObject *object, uintN argc,
                            jsval *argv, jsval *rval)
{
    gezira_pixmap_painter_t *painter;
    gezira_object_t *scene;

    painter = (gezira_pixmap_painter_t *) JS_GetPrivate (context, object);
    scene = (gezira_object_t *)
        JS_GetPrivate (context, JSVAL_TO_OBJECT (argv[0]));
    gezira_pixmap_painter_paint (painter, scene);

    return JS_TRUE;
}

static JSClass pixmap_painter_class = {
    "PixmapPainter", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int pixmap_painter_class_constructor_argc = 4;
static JSPropertySpec pixmap_painter_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec pixmap_painter_class_functions[] = {
    {"paint", pixmap_painter_class_paint, 0, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Object

static JSBool
object_class_constructor (JSContext *context, JSObject *object, uintN argc,
                          jsval *argv, jsval *rval)
{
    gezira_object_t *gobject;

    gobject = (gezira_object_t *) malloc (sizeof (*gobject));
    gobject->type = 0;
    JS_SetPrivate (context, object, gobject);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass object_class = {
    "Object", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int object_class_constructor_argc = 0;
static JSPropertySpec object_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec object_class_functions[] = {{NULL, NULL, 0, 0, 0}};

// Parent

static JSBool
parent_class_constructor (JSContext *context, JSObject *object, uintN argc,
                          jsval *argv, jsval *rval)
{
    gezira_parent_t *parent;

    parent = (gezira_parent_t *) malloc (sizeof (*parent));
    JS_SetPrivate (context, object, parent);
    parent->object.type = gezira_parent_type;

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
parent_class_child (JSContext *context, JSObject *object, uintN argc,
                    jsval *argv, jsval *rval)
{
    gezira_parent_t *parent;

    parent = (gezira_parent_t *) JS_GetPrivate (context, object);
    parent->child = (gezira_object_t *)
        JS_GetPrivate (context, JSVAL_TO_OBJECT (argv[0]));
    JS_SetProperty (context, object, "_child", &argv[0]);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass parent_class = {
    "Parent", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int parent_class_constructor_argc = 0;
static JSPropertySpec parent_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec parent_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Background

static JSBool
background_class_set_color (JSContext *context, JSObject *object,
                            jsval id, jsval *vp)
{
    double d;
    gezira_real_t real;

    gezira_background_t *background = (gezira_background_t *)
        JS_GetPrivate (context, object);
    JS_ValueToNumber (context, *vp, &d);
    real = GEZIRA_REAL (d);
    switch (JSVAL_TO_INT (id)) {
        case 0: background->r = real; break;
        case 1: background->g = real; break;
        case 2: background->b = real; break;
    }

    return JS_TRUE;
}

static JSBool
background_class_constructor (JSContext *context, JSObject *object, uintN argc,
                              jsval *argv, jsval *rval)
{
    double d;
    gezira_background_t *background;
    
    background = (gezira_background_t *) malloc (sizeof (*background));
    JS_SetPrivate (context, object, background);
    background->parent.object.type = gezira_background_type;
    JS_ValueToNumber (context, argv[0], &d);
    background->r = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[1], &d);
    background->g = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[2], &d);
    background->b = GEZIRA_REAL (d);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass background_class = {
    "Background", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int background_class_constructor_argc = 3;
static JSPropertySpec background_class_property_specs[] = {
    {"r", 0, 0, NULL, background_class_set_color},
    {"g", 1, 0, NULL, background_class_set_color},
    {"b", 2, 0, NULL, background_class_set_color},
    {0, 0, 0, 0, 0}};
static JSFunctionSpec background_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// ColorOver

static JSBool
color_over_class_constructor (JSContext *context, JSObject *object, uintN argc,
                              jsval *argv, jsval *rval)
{
    double d;
    gezira_color_over_t *color_over;

    color_over = (gezira_color_over_t *) malloc (sizeof (*color_over));
    JS_SetPrivate (context, object, color_over);
    color_over->parent.object.type = gezira_color_over_type;
    JS_ValueToNumber (context, argv[0], &d);
    color_over->a = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[1], &d);
    color_over->r = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[2], &d);
    color_over->g = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[3], &d);
    color_over->b = GEZIRA_REAL (d);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
color_over_class_set_color (JSContext *context, JSObject *object,
                            jsval id, jsval *vp)
{
    double d;
    gezira_real_t real;
    gezira_color_over_t *color_over;
    
    color_over = (gezira_color_over_t *) JS_GetPrivate (context, object);
    JS_ValueToNumber (context, *vp, &d);
    real = GEZIRA_REAL (d);
    switch (JSVAL_TO_INT (id)) {
        case 0: color_over->a = real; break;
        case 1: color_over->r = real; break;
        case 2: color_over->g = real; break;
        case 3: color_over->b = real; break;
    }

    return JS_TRUE;
}

static JSClass color_over_class = {
    "ColorOver", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int color_over_class_constructor_argc = 4;
static JSPropertySpec color_over_class_property_specs[] = {
    {"a", 0, 0, NULL, color_over_class_set_color},
    {"r", 1, 0, NULL, color_over_class_set_color},
    {"g", 2, 0, NULL, color_over_class_set_color},
    {"b", 3, 0, NULL, color_over_class_set_color},
    {0, 0, 0, 0, 0}};
static JSFunctionSpec color_over_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Composite

static JSBool
composite_class_constructor (JSContext *context, JSObject *object, uintN argc,
                             jsval *argv, jsval *rval)
{
    gezira_composite_t *composite;

    composite = (gezira_composite_t *) malloc (sizeof(*composite));
    JS_SetPrivate (context, object, composite);
    composite->parent.object.type = gezira_composite_type;

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass composite_class = {
    "Composite", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int composite_class_constructor_argc = 0;
static JSPropertySpec composite_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec composite_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Lines

static void
process_coords (JSContext *context, jsval xs, jsval ys, gezira_coords_t *coords)
{
    int i;
    JSObject *xs_array = JSVAL_TO_OBJECT (xs);
    JSObject *ys_array = JSVAL_TO_OBJECT (ys);

    JS_GetArrayLength (context, xs_array, (jsuint *) &coords->n);
    coords->xs = (gezira_real_t *) malloc (coords->n * sizeof (gezira_real_t));
    coords->ys = (gezira_real_t *) malloc (coords->n * sizeof (gezira_real_t));

    for (i = 0; i < coords->n; i++) {
        double d;
        jsval val;

        JS_GetElement (context, xs_array, i, &val);
        JS_ValueToNumber (context, val, &d);
        coords->xs[i] = GEZIRA_REAL (d);
        JS_GetElement (context, ys_array, i, &val);
        JS_ValueToNumber (context, val, &d);
        coords->ys[i] = GEZIRA_REAL (d);
    }
}

static JSBool
lines_class_constructor (JSContext *context, JSObject *object, uintN argc,
                         jsval *argv, jsval *rval)
{
    gezira_lines_t *lines;
    
    lines = (gezira_lines_t *) malloc (sizeof (*lines));
    JS_SetPrivate (context, object, lines);
    lines->coords.object.type = gezira_lines_type;
    process_coords (context, argv[0], argv[1], &lines->coords);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass lines_class = {
    "Lines", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int lines_class_constructor_argc = 2;
static JSPropertySpec lines_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec lines_class_functions[] = {{NULL, NULL, 0, 0, 0}};

// Bezier3s


static JSBool
bezier3s_class_constructor (JSContext *context, JSObject *object, uintN argc,
                            jsval *argv, jsval *rval)
{
    gezira_bezier3s_t *bezier3s;

    bezier3s = (gezira_bezier3s_t *) malloc (sizeof (*bezier3s));
    JS_SetPrivate (context, object, bezier3s);
    bezier3s->coords.object.type = gezira_bezier3s_type;
    process_coords (context, argv[0], argv[1], &bezier3s->coords);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass bezier3s_class = {
    "Bezier3s", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int bezier3s_class_constructor_argc = 2;
static JSPropertySpec bezier3s_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec bezier3s_class_functions[] = {{NULL, NULL, 0, 0, 0}};

// Translation

static JSBool
translation_class_constructor (JSContext *context, JSObject *object, uintN argc,
                               jsval *argv, jsval *rval)
{
    double d;
    gezira_translation_t *translation;
    
    translation = (gezira_translation_t *) malloc (sizeof (*translation));
    JS_SetPrivate (context, object, translation);
    translation->parent.object.type = gezira_translation_type;
    JS_ValueToNumber (context, argv[0], &d);
    translation->x = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[1], &d);
    translation->y = GEZIRA_REAL (d);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
translation_class_set (JSContext *context, JSObject *object,
                       jsval id, jsval *vp)
{
    double d;
    gezira_real_t real;

    gezira_translation_t *translation =
        (gezira_translation_t *) JS_GetPrivate (context, object);
    JS_ValueToNumber (context, *vp, &d);
    real = GEZIRA_REAL (d);
    switch (JSVAL_TO_INT (id)) {
        case 0: translation->x = real; break;
        case 1: translation->y = real; break;
    }

    return JS_TRUE;
}

static JSClass translation_class = {
    "Translation", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int translation_class_constructor_argc = 2;
static JSPropertySpec translation_class_property_specs[] = {
    {"x", 0, 0, NULL, translation_class_set},
    {"y", 1, 0, NULL, translation_class_set},
    {0, 0, 0, 0, 0}};
static JSFunctionSpec translation_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Rotation

static JSBool
rotation_class_constructor (JSContext *context, JSObject *object, uintN argc,
                            jsval *argv, jsval *rval)
{
    double d;
    gezira_rotation_t *rotation;
    
    rotation = (gezira_rotation_t *) malloc (sizeof (*rotation));
    JS_SetPrivate (context, object, rotation);
    rotation->parent.object.type = gezira_rotation_type;
    JS_ValueToNumber (context, argv[0], &d);
    rotation->angle = GEZIRA_REAL (d);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
rotation_class_set_angle (JSContext *context, JSObject *object,
                          jsval id, jsval *vp)
{
    double d;
    gezira_rotation_t *rotation;
    
    rotation = (gezira_rotation_t *) JS_GetPrivate (context, object);
    JS_ValueToNumber (context, *vp, &d);
    rotation->angle = GEZIRA_REAL (d);

    return JS_TRUE;
}

static JSClass rotation_class = {
    "Rotation", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int rotation_class_constructor_argc = 1;
static JSPropertySpec rotation_class_property_specs[] = {
    {"angle", 1, 0, NULL, rotation_class_set_angle},
    {0, 0, 0, 0, 0}};
static JSFunctionSpec rotation_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Scale

static JSBool
scale_class_constructor (JSContext *context, JSObject *object, uintN argc,
                         jsval *argv, jsval *rval)
{
    double d;
    gezira_scale_t *scale;

    scale = (gezira_scale_t *) malloc (sizeof (*scale));
    JS_SetPrivate (context, object, scale);
    scale->parent.object.type = gezira_scale_type;
    JS_ValueToNumber (context, argv[0], &d);
    scale->x = GEZIRA_REAL (d);
    JS_ValueToNumber (context, argv[1], &d);
    scale->y = GEZIRA_REAL (d);

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
scale_class_set (JSContext *context, JSObject *object, jsval id, jsval *vp)
{
    double d;
    gezira_real_t real;

    gezira_scale_t *scale =
        (gezira_scale_t *) JS_GetPrivate (context, object);
    JS_ValueToNumber (context, *vp, &d);
    real = GEZIRA_REAL (d);
    switch (JSVAL_TO_INT (id)) {
        case 0: scale->x = real; break;
        case 1: scale->y = real; break;
    }

    return JS_TRUE;
}

static JSClass scale_class = {
    "Scale", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int scale_class_constructor_argc = 2;
static JSPropertySpec scale_class_property_specs[] = {
    {"x", 0, 0, NULL, scale_class_set},
    {"y", 1, 0, NULL, scale_class_set},
    {0, 0, 0, 0, 0}};
static JSFunctionSpec scale_class_functions[] = {
    {"child", parent_class_child, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

// Group

static JSBool
group_class_constructor (JSContext *context, JSObject *object, uintN argc,
                         jsval *argv, jsval *rval)
{
    gezira_group_t *group;

    group = (gezira_group_t *) malloc (sizeof (*group));
    JS_SetPrivate (context, object, group);
    group->object.type = gezira_group_type;
    group->n = 0;
    group->group = NULL;

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSBool
group_class_children (JSContext *context, JSObject *object, uintN argc,
                      jsval *argv, jsval *rval)
{

    int i;
    JSObject *array = JSVAL_TO_OBJECT (argv[0]);
    gezira_group_t *group;
    
    group = (gezira_group_t *) JS_GetPrivate (context, object);
    JS_GetArrayLength (context, array, (jsuint *) &group->n);
    group->group = (gezira_object_t **)
        malloc (group->n * sizeof (gezira_object_t *));

    for (i = 0; i < group->n; i++) {
        jsval val;
        JS_GetElement (context, array, i, &val);
        group->group[i] = (gezira_object_t *)
            JS_GetPrivate (context, JSVAL_TO_OBJECT (val));
    }

    *rval = OBJECT_TO_JSVAL (object);
    return JS_TRUE;
}

static JSClass group_class = {
    "Group", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static int group_class_constructor_argc = 0;
static JSPropertySpec group_class_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec group_class_functions[] = {
    {"children", group_class_children, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

void
initialize (JSContext *context)
{
    JSObject *gezira;

    gezira = JS_DefineObject (context, JS_GetGlobalObject (context),
                              "gezira", NULL, NULL, 0);
#define INIT_CLASS(name) \
    JS_InitClass (context, gezira, NULL, &name##_class, \
                  name##_class_constructor, name##_class_constructor_argc, \
                  name##_class_property_specs, name##_class_functions, NULL, NULL)

    INIT_CLASS (pixmap_painter);
    INIT_CLASS (object);
    INIT_CLASS (parent);
    INIT_CLASS (background);
    INIT_CLASS (color_over);
    INIT_CLASS (composite);
    INIT_CLASS (lines);
    INIT_CLASS (bezier3s);
    INIT_CLASS (group);
    INIT_CLASS (translation);
    INIT_CLASS (scale);
    INIT_CLASS (rotation);
}
