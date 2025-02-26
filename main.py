from flask import Flask
from models import db,Register


app = Flask(__name__)

from routes import *

if __name__ == "__main__":
    app.run()