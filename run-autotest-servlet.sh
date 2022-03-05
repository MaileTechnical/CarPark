#!/bin/bash
CIERA_VERSION=2.5.4
CLASSPATH=$HOME/.m2/repository/io/ciera/runtime/$CIERA_VERSION/runtime-$CIERA_VERSION.jar:$HOME/.m2/repository/org/json/json/20180813/json-20180813.jar
java -cp $CLASSPATH -jar $HOME/.m2/repository/org/xtuml/CarParkTestbench/1.0.0-SNAPSHOT/CarParkTestbench-1.0.0-SNAPSHOT.jar
