#!/usr/local/bin/python3
# AUTHOR: jarndt

import argparse
import inspect
import json
import socket
import subprocess
import pexpect
from pprint import pprint

import requests
from bs4 import BeautifulSoup

VERSION = "1.0"
DESCRIPTION = '''\
Run BLT Commands
'''
EXAMPLES = '''\
./blt.py --check-health
'''

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
    "Host": "auth-crd.ops.sfdc.net",
    "Referer": "https://auth-crd.ops.sfdc.net/dana-na/auth/url_default/welcome.cgi?p=forced-off",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
}


class BLT:
    # alert = False # maybe use this send a notification if app changes from up or down
    host = '127.0.0.1'
    port = 6109
    health_check_consts = {
        'UP': 'UP',
        'DOWN': 'DOWN'
    }

    def __init__(self) -> None:
        super().__init__()
        methods = inspect.getmembers(self, predicate=inspect.ismethod)
        functions = []
        builtins = ['__init__', 'command_line']
        for method in methods:
            if method[0] in builtins: continue
            functions.append(method[0])
        self.functions = functions

    def command_line(self):
        v = '%(prog)s {version}'.format(version=VERSION)
        my_parser = argparse.ArgumentParser(
            formatter_class=argparse.RawDescriptionHelpFormatter,
            description=v + " - " + DESCRIPTION, prog="blt"
        )
        my_parser.add_argument("-V", "--program-version", action='version',
                               version=v)
        my_parser.add_argument("-p", "--pretty", help="pretty print json", action="store_true")
        my_parser.add_argument("url", help="supply this url if it's not localhost", nargs="?", default='127.0.0.1')
        # my_parser.add_argument("-a", "--alert", help="alert if values change", action="store_true")
        for function in self.functions:
            # inspect.signature(eval('self.execute_request')).parameters['method'].default == inspect._empty
            params = inspect.signature(eval('self.' + function)).parameters.values()
            param_names = [i.name for i in params if i.default == inspect._empty]
            optionals = [(i.name, i.default) for i in params if i.default != inspect._empty]
            if optionals or len(param_names) > 0:
                my_parser.add_argument("--" + function,
                                       nargs="*" if optionals else len(param_names) if len(param_names) > 0 else None,
                                       metavar=tuple(param_names) if param_names and not optionals
                                       else (' '.join(param_names), "") if param_names and optionals else None,
                                       help="Optional args: " + " ".join(["[{0}={1}]".format(*p)
                                                                          if p[1] else "[{0}]".format(p[0])
                                                                          for p in optionals])
                                       if len(optionals) > 0 else None)
            else:
                my_parser.add_argument("--" + function, nargs='*')
        args = my_parser.parse_args()
        self.pretty = args.pretty
        self.host = args.url
        # self.alert = args.alert

        for arg, value in args.__dict__.items():
            if arg in self.functions and value is not None:
                self.called_function = function
                try:
                    res = eval('self.' + arg)(*value)
                    if self.pretty:
                        pprint(res)
                    else:
                        print(json.dumps(res))
                except Exception as e:
                    print(e)
                exit(0)

    def check_host(self,host,port=22):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        return sock.connect_ex((host, int(port)))

    def check_connection_to_sfm(self):
        pass

    def health_check_1(self):
        return self.check_host(self.host,port=self.port)

    def health_check_2(self):
        try:
            soup = BeautifulSoup(requests.get('http://' + self.host + ':' + str(self.port)).content,
                                 features="html.parser")
            return 0 if len(soup.select('#usernamegroup')) > 0 else 1
        except Exception:
            return 1

    def health_check_app(self):
        return {
            'port_check': self.health_check_consts['UP'] if self.health_check_1() == 0 else
            self.health_check_consts['DOWN'],
            'ui_check': self.health_check_consts['UP'] if self.health_check_2() == 0 else
            self.health_check_consts['DOWN']
        }

    def health_check(self):
        return {
            'app': self.health_check_app()
        }

    def check_sfm(self):
        try:
            child = pexpect.spawn('blt --sfm', timeout=30)
            return 'is not needed' not in str(child.read())
        except Exception:
            return True


if __name__ == '__main__':
    # print('hi')
    # r = BLT().check_sfm()
    # print(r)
    BLT().command_line()
