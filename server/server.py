import asyncio
import json
import re
from subprocess import Popen, PIPE

from flask import Flask, escape, request, render_template

'''
Flask app
'''
# 7-bit C1 ANSI sequences
ansi_escape = re.compile(r'''
    \x1B  # ESC
    (?:   # 7-bit C1 Fe (except CSI)
        [@-Z\\-_]
    |     # or [ for CSI, followed by a control sequence
        \[
        [0-?]*  # Parameter bytes
        [ -/]*  # Intermediate bytes
        [@-~]   # Final byte
    )
''', re.VERBOSE)

def run(cmd):
    proc = Popen(cmd, stdout=PIPE, stderr=PIPE, shell=True)

    stdout, stderr = proc.communicate()

    return {
        'stdout': ansi_escape.sub('', stdout.decode()),
        'stderr': ansi_escape.sub('', stderr.decode()),
        'returncode': proc.returncode,

    }


app = Flask(__name__, static_folder='/Users/jarndt/code_projects/create-react-app-salesforce-lightning/build',
            static_url_path='/')


@app.route('/')
def index():
    '''Serves the static content index.html add the static_folder from above'''
    return app.send_static_file('index.html')


@app.route('/hello')
def hello():
    return json.dumps(run('blt --stop'))


@app.route('/file')
def content():
    content = "<pre>"
    with open('/Users/jarndt/blt/config.blt', 'r+') as f:
        content += f.read()+"<br/>"
    return content+"</pre>"


if __name__ == '__main__':
    print(json.dumps(run('blt --stop')))
