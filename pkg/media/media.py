import config
import uuid
import json
import os
import datetime
from werkzeug.wrappers import Request, Response
from werkzeug.routing import Map,Rule
from werkzeug.exceptions import HTTPException, NotFound, Unauthorized, BadRequest
from werkzeug.wsgi import wrap_file
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from db import *

files_dir = os.path.join(os.path.dirname(__file__), 'files')
db_dir = os.path.join(os.path.dirname(__file__), 'local')
mime_lookup = {
    'bmp': 'image/bmp',
    'gif': 'image/gif',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp'
}

class FileServer():
    engine = None

    def __init__(self,):
        self.url_map = Map([
            Rule('/media/<media_id>/<filename>',endpoint='get_photo'),
            Rule('/media/upload_photo', endpoint='upload_photo'),
            Rule('/media/get_photo_by_file', endpoint='get_photo_by_file'),
            Rule('/media/get_photo_by_post', endpoint='get_photo_by_post')
        ])
        self.engine = create_engine("sqlite:///" + os.path.join(db_dir, 'media.sqlite'), echo=True)

    def __call__(self, env, start_response):
        request = Request(env)
        response = self.dispatch_request(request)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response(env, start_response)

    def dispatch_request(self, request):
        '''
        check token first, then find the right method to call
        '''
        adapter = self.url_map.bind_to_environ(request.environ)
        try:
            endpoint, values = adapter.match()
            return getattr(self, f'{endpoint}')(request, **values)
        except HTTPException as e:
            return e

    def authenticate(self, token):
        priv = token.split(':')
        for i in priv:
            if i == 'media':
                return True
        return False

    def success(self, response, message=None):
        response['result'] = 'success'
        response['message'] = message
        return json.dumps(response)

    def failed(self, response, message=None):
        response['result'] = 'failed'
        response['message'] = message
        return json.dumps(response)

    def get_photo(self, request, media_id, filename):
        '''
        GET
        the media files are stored by their unique id instead of file name
        this takes the input and output the corresponding file on the disk
        '''
        if request.method != 'GET':
            raise NotFound()
            #if not self.authenticate(request.cookies['token']):
            #raise Unauthorized("invalid token")
        with Session(self.engine) as session:
            query = select(Media.filename).where(Media.media_id.__eq__(media_id))
            result = session.scalars(query).first()
            if result == None or result != filename:
                raise NotFound()
            f = open(os.path.join(files_dir, media_id), 'rb')
            response = Response(wrap_file(request.environ,f))
            response.headers['content-type'] = mime_lookup[result.split('.')[-1]]
            return response

    def get_photo_by_post(self, request):
        '''
        POST
        main way of accessing a file, to display correctly you will need a post id
        it only returns the generated url to that specific file
        '''
        if request.method != 'POST':
            raise NotFound()
            #if not self.authenticate(request.cookies['token']):
            #raise Unauthorized("invalid token")
        # lookup file
        params = request.json
        with Session(self.engine) as session:
            query = select(Media).where(Media.post_id.in_([params['post_id']]))
            result = session.scalars(query).first()
            if result == None:
                raise NotFound()
            url = request.host_url + 'media/' + result.media_id + '/' + result.filename
            response = {'url': url}
        return Response(self.success(response), mimetype='application/json')

    def upload_photo(self, request):
        '''
        takes a uploaded file, check if the file type is allowed, then store it
        allow duplicates of the same file
        '''
        if request.method != 'POST':
            raise NotFound()
            #if not self.authenticate(request.cookies['token']):
            #raise Unauthorized("invalid token")
        # add file
        file = request.files['file']
        if file.filename.split('.')[-1] not in mime_lookup:
            raise BadRequest()
        with Session(self.engine) as session:
            photo = Media(
                media_id = str(uuid.uuid4()),
                post_id = request.form['post_id'],
                user_id = request.form['user_id'],
                filename = file.filename,
                timestamp = datetime.datetime.now().replace(microsecond=0)
            )
            session.add(photo)
            session.commit()
            file.save(os.path.join(files_dir, photo.media_id))
        response = {}
        return Response(json.dumps(response), mimetype='application/json')

if __name__ == "__main__":
    from werkzeug import run_simple

    if not os.path.exists(files_dir):
        os.makedirs(files_dir)
    app = FileServer()
    #app = SharedDataMiddleware(FileServer(), {
    #'/media-legacy': files_dir
    #})
    init_db()
    run_simple(config.hostname, config.port, app, use_debugger=config.use_debugger, use_reloader=config.use_reloader)
