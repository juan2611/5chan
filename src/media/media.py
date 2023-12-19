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
from Crypto.Random.random import getrandbits
from datetime import datetime, timedelta
from Crypto.Hash import SHA256
from util import *

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

keys = {}
expire = {}
def valid_key(addr):
    if addr not in keys:
        return False
    else:
        if datetime.now() > expire[addr]:
            del expire[addr]
            del keys[addr]
            return False
    return True

auth_timeout = 720
p = 577891979226697945570213780521809426563365791435615832711012378975984090706711917615938495479321251358605416479067241081499497036839950356312625597915929364713575346541675959839159009416370898443127459344409878709845697518679122868962118907715571007000916180621970149148136229013170679223203460365617450421691941273835363116508991034178359390084708401581953959008754168771552735521904480713439940947226031866986121762340975621049253684451435399030266860183064954357336799400350480461284469165141631413805707145204708837559352239067360772939965058210616259303108609951008480806667347855751672593239289058012594718617219786601449982343198203231748683266822819073665711182271257734849627858310345536879821077935399795186538030449767160405711762844960031523239541898481869878913445358646928023166940768223088754414136964463018749469689652124543359528248272704783756259254408405133060554006685687358333240561439885337656631093448524482764852413691768290115225854434316473796757712296260976691154626491990747850785649812567977965618087169928752768736500994467612790526523884398574478437931941918120157206366766875928558302834507669957053069399504813957691091119203137043900000222354063927513406469713721166441337402223171582540462531999967
g = 5

def hash_string_sha256_new(input_string):
    return SHA256.new(input_string.encode()).digest()

class FileServer():
    engine = None

    def __init__(self,):
        self.url_map = Map([
            Rule('/media/<media_id>/<filename>',endpoint='get_photo'),
            Rule('/media/upload_photo', endpoint='upload_photo'),
            Rule('/media/get_photo_by_file', endpoint='get_photo_by_file'),
            Rule('/media/get_photo_by_post', endpoint='get_photo_by_post'),
            Rule('/media/key-exchange', endpoint='diffie-hellman')
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
        return Response(self.success(response), 200, mimetype='application/json')

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
        return Response(json.dumps(response), 200, mimetype='application/json')

    def diffie_hellman(self, request):
        global keys
        if request.method == "POST":
            obj = request.json
            A = int('0x0' + obj['A'], 16)
            s = getrandbits(512)
            keys[request.remote_addr] =  hash_string_sha256_new(f'{A ^ s % p:0x}')
            expire[request.remote_addr] = datetime.now() + timedelta(hours=2)
            return Response(json.dumps({'B': f'0x0{g ^ s % p:0x}'}), 200, mimetype='application/json')

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
