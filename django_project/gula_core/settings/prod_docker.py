
"""Configuration for production server"""
# noinspection PyUnresolvedReferences
from .prod import *  # noqa
import os

DEBUG = False

ALLOWED_HOSTS = ['*']

ADMINS = (
    ('Alison Mukoma', 'alison@devsbranch.com'),
)

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DATABASE_NAME'),
        'USER': os.environ.get('DATABASE_USERNAME'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
        'HOST': os.environ.get('DATABASE_HOST'),
        'PORT': 5432,
        'TEST_NAME': 'unittests',
    }
}


# See fig.yml file for postfix container definition
#
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# Host for sending e-mail.
EMAIL_HOST = 'smtp'
# Port for sending e-mail.
EMAIL_PORT = 25
# SMTP authentication information for EMAIL_HOST.
# See fig.yml for where these are defined
EMAIL_HOST_USER = 'noreply@devsbranch.com'
EMAIL_HOST_PASSWORD = 'docker'
EMAIL_USE_TLS = False
EMAIL_SUBJECT_PREFIX = '[Gula Inc.]'

HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'bims.search_backends.fuzzy_elastic_search_engine'
                  '.FuzzyElasticSearchEngine',
        'URL': 'http://%s:9200/' % os.environ['HAYSTACK_HOST'],
        'INDEX_NAME': 'haystack',
    },
}
