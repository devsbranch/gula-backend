# coding=utf-8

"""Project level settings.

Adjust these values as needed but don't commit passwords etc. to any public
repository!
"""

import os  # noqa
from django.utils.translation import ugettext_lazy as _
from .contrib import *  # noqa
try:
    from core.settings.project import *
except ImportError:
    pass
from .utils import absolute_path

# Project apps
INSTALLED_APPS += (
    'api',
    'gula_base',
    # please add project specific apps here
)

try:
    from core.settings.utils import ensure_unique_app_labels
    INSTALLED_APPS = ensure_unique_app_labels(INSTALLED_APPS)
except ImportError:
    pass


try:
    TEMPLATES[0]['DIRS'] = [
        absolute_path('core', 'base_templates'),
        absolute_path('gula_base', 'templates'),
    ] + TEMPLATES[0]['DIRS']

    TEMPLATES[0]['OPTIONS']['context_processors'] += [
        'bims.context_processor.custom_navbar_url'
    ]
except KeyError:
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [
                # project level templates
                absolute_path('core', 'base_templates'),
                absolute_path('gula_base', 'templates'),
            ],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',

                    # `allauth` needs this from django
                    'django.template.context_processors.request',
                    'base.context_processor.add_links',
                    'bims.context_processor.custom_navbar_url',
                ],
            },
        },
    ]

# Additional locations of static files
STATICFILES_DIRS = [
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    absolute_path('core', 'base_static'),
    absolute_path('gula_base', 'static'),
] + STATICFILES_DIRS


# Set languages which want to be translated
LANGUAGES = (
    ('en', _('English')),
)

VALID_DOMAIN = [
    '0.0.0.0',
]

PIPELINE = {
    'STYLESHEETS': {
        'healthyriver-base': {
            'source_filenames': {
                'js/libs/bootstrap-4.0.0/css/bootstrap.min.css',
                'js/libs/font-awesome/css/font-awesome.min.css',
                'js/libs/magnific-popup/magnific-popup.css',
                'js/libs/openlayers-4.6.4/ol.css',
                'js/libs/jquery-ui-1.12.1/jquery-ui.min.css',
                'css/base.css',
            },
            'output_filename': 'css/healthyriver-base.css',
            'extra_content': {
                'media': 'screen, projection',
            }
        }
    },
    'JAVASCRIPT': {

    }
}

REQUIRE_JS_PATH = '/static/js/libs/requirejs-2.3.5/require.js'

GRUNT_MODULES = {
    'map_view': {
        'main': 'js/app',
        'optimized': 'js/optimized.js',
    }
}

ACCOUNT_ADAPTER = 'bims.adapters.account_adapter.AccountAdapter'
ECOLOGICAL_CONDITION_FILTER = True
CONSERVATION_STATUS_FILTER = True
REFERENCE_CATEGORY_FILTER = True
