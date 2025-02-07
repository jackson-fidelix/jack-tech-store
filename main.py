from flask import Flask
#estudar sobre sqlalchemy para importar e criar um banco 

app = Flask(__name__)

from routes import *

if __name__ == "__main__":
    app.run()