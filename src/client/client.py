import os
from werkzeug.middleware.shared_data import SharedDataMiddleware
from werkzeug.wrappers import Response
from werkzeug.utils import redirect

class FauxServer:
    def __call__(self, environ, start_response):
        response = redirect('/index.html')
        return response(environ, start_response)

if __name__ == "__main__":
    app = FauxServer()
    app = SharedDataMiddleware(app, {
        '/': os.path.join(os.path.dirname(__file__), '')
    })
    from werkzeug.serving import run_simple
    run_simple('localhost', 3000, app, use_debugger=False, use_reloader=False)
