# Tarea2_SD - Rubén Hermosilla - Brian Castro
#### Melon Musk compró una de las plataformas de redes sociales más grande del mundo: Fruitter. Esta plataforma funciona correctamente, sin embargo, a Melon Musk no le gusta el sistema de login que este posee (a pesar de ser un sistema completo y funcional), debido a que él busca cosas muy específicas, entre ellas eliminar a los bots dentro de la plataforma. 
Los requerimientos que Melon Musk quiere para el nuevo sistema de login son los siguientes:
- Login en una API REST
- Utilización de Kafka para comunicar los inicios de sesión con un topic para lo mismo.
- Si existen 5 inicios de sesión por parte de un usuario en menos de 1 minuto, se debería bloquear la cuenta.
- El uso de una base de datos para guardar las distintas cuentas no es necesario, pero debe existir un registro que
guarde si la cuenta de encuentra bloqueada o no. Se recomienda el uso de un JSON. (Melon musk tiene su propia
base de datos distribuida para guardar a los usuarios de Fruitter).


# Kafka
Apache Kafka es una plataforma de transmisión de eventos distribuída por la comunidad capaz de manejar billones de eventos al día. Inicialmente concebido como una cola de mensajería, Kafka se basa en una abstracción de un registro de confirmación distribuido. Desde que LinkedIn lo creó y abrió su código abierto en 2011, Kafka ha evolucionado rápidamente de una cola de mensajes a una plataforma de transmisión de eventos completa.

## Publicar y Suscribirse
En su corazón se encuentra el registro de confirmación, y desde allí puede suscribirse y publicar datos en cualquier número de sistemas o aplicaciones en tiempo real. A diferencia de las colas de mensajería, Kafka es un sistema distribuido altamente escalable y tolerante a fallas, lo que permite que se implemente para aplicaciones tales como la gestión de coincidencias de pasajeros y conductores en la aplicación Uber. También proporciona análisis en tiempo real y mantenimiento predictivo para el hogar inteligente de British Gas y realiza numerosas tareas reales. Este rendimiento único lo hace perfecto para escalar desde una aplicación hasta el uso en toda la empresa.

## ¿Por qué es útil Kafka para esta problemática?

Los microservicios han cambiado el panorama del desarrollo, ya que al reducir las dependencias, como los niveles de bases de datos compartidas, los desarrolladores obtienen mayor agilidad. No obstante, las aplicaciones distribuidas que diseñan sus desarrolladores aún necesitan algún tipo de integración para compartir los datos. Una opción popular, conocida como el método sincrónico, utiliza interfaces de programación de aplicaciones (API) para compartir datos entre los diferentes usuarios.

Otra alternativa, el método asíncrono, implica replicar los datos en un almacén intermedio. Aquí es donde Apache Kafka entra en acción, ya que transmite los datos de otros equipos de desarrollo para rellenar el almacén de datos, de modo que estos puedan compartirse entre varios equipos y sus aplicaciones.

Los equipos de microservicios tienen requisitos de integración distintos de los equipos tradicionales de desarrollo en cascada. Requieren tres características fundamentales:

- Integraciones distribuidas: integraciones ligeras basadas en patrones que se puedan implementar de forma constante donde sea necesario y que no estén limitadas por las implementaciones centralizadas del tipo ESB.
- API: servicios basados en las API para promover un ecosistema de partners, clientes y desarrolladores que puedan ofrecer un uso confiable y rentable de los servicios.
- Contenedores: plataforma diseñada para desarrollar, gestionar y ajustar aplicaciones conectadas y creadas en la nube. Los contenedores permiten el desarrollo de artefactos eficaces que se pueden implementar de manera individual, que forman parte de los procesos de DevOps y que son compatibles con la agrupación en clústeres lista para usar, lo que garantiza su alta disponibilidad.

## Manejo de gran volumen de usuarios

Gracias a sus características, para manejar una gran cantidad de usuarios se puede hacer uso de las herramientas disponibles en Kafka, Brokers y Topics.

Un topic es un flujo de datos sobre un tema en particular. Se pueden crear tantos topics como se quieran y estos serán identificados por su nombre. Los topics pueden dividirse en particiones en el momento de su creación.

Cada elemento que se almacena en un topic se denomina mensaje. Los mensajes son inmutables y son añadidos a una partición determinada (específica definida por la clave del mensaje o mediante round-robin en el caso de ser nula) en el orden el que fueron enviados, es decir, se garantiza el orden dentro de una partición pero no entre ellas.

Cada mensaje dentro de una partición tiene un identificador numérico incremental llamado offset. Aunque los mensajes se guarden en los topics por un tiempo limitado (una semana por defecto) y sean eliminados, el offset seguirá incrementando su valor.


Un clúster de Kafka consiste en uno o más servidores denominados Kafka brokers. Cada broker es identificado por un ID (integer) y contiene ciertas particiones de un topic, no necesariamente todas.

Además, permite replicar y particionar dichos topics balanceando la carga de almacenamiento entre los brokers. Esta característica permite que Kafka sea tolerante a fallos y escalable.

# Módulos implementados en la solución
## Kafka

Plataforma de transmisión de eventos distribuída, se define en un contenedor con el nombre de kafka y su configuración inicial es:
```
  kafka:
    container_name: kafka-server
    image: 'bitnami/kafka:latest'
    networks:
      - lared
    depends_on:
      - zookeeper
    environment:
      - KAFKA_ADVERTISED_HOST_NAME=kafka
      - KAFKA_ADVERTISED_PORT=9092
      - ALLOW_PLAINTEXT_LISTENER=yes
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
    ports:
      - 9092:9092
      - 9093:9093
```

Como se puede observar en su definición, kafka depende de una tecnología llamada Zookeper.

ZooKeeper es un proyecto de Apache que provee un servicio centralizado para diversas
tareas como por ejemplo mantenimiento de configuración, naming, sincronización distribuida o servicios de agrupación, servicios que
normalmente son consumidos por otras aplicaciones distribuidas.

Por lo que también hay que definir un contenedor que almacene este Zookeper necesario para inicializar kafka

```
  zookeeper:
    image: 'bitnami/zookeeper:latest'
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
    networks:
      - lared
    ports:
      - 2181:2181
```
La función principal de este módulo es proveer un canal de comunicación entre 2 o más microservicios, mediante publicadores y consumidores de información.

## Client
Este módulo API-REST actúa sobre un servidor del Framework Node y express , el cuál recibe por parámetro POST() un usuario y una contraseña, para luego conectarse al servidor kafka con el tipo de autenticación producer, es decir publicador de mensajes en el topic 'login' y enviarlos al canal, además se genera una tercera variable que representa el datetime.now() en el cuál el usuario ha hecho uso del microservicio de login.

Para hacer uso del servicio de login hay que acceder a la siguiente url:

- http://localhost:3000/login

y mediante un gestor de consultas, como lo es Postman llenar el body que representar los parámetros a entregar a la api.

Para el caso en particular del software Postman, se rellena el apartado Body, en la opción "x-www-form-urlencoded" con las keys user y pass.

- Configuración inicial del Client:
```
  cliente:
    container_name: cliente-node
    build: ../Client/
    networks:
      - lared
    ports:
      - 3000:3000
    volumes:
      - ../Client:/app
    environment:
      - kafka=kafka
```



## Server

Este módulo API-REST actúa sobre un servidor del Framework Node y express , se conecta al servidor kafka con el tipo de autenticación consumer, es decir consumidor de mensajes en el topic 'login' y recibe los intentos de inicio de sesión que son enviados al login, luego verifica si el usuario se encuentra registrado o no.
- Si el usuario está iniciando sesión por primera vez, se crea un diccionario con llave username, y valor tupla con el datetime.now() actual.

Si no es primera vez que inicia sesión

- Se verifica otra tupla que contiene a los usuarios bloqueados actualmente.

Entonces...

- Si el usuario está en esa tupla se responde con un blocked.
- Si el usuario no está en esa tupla, se utiliza el diccionario de inicios de sesiones para calcular los intentos de login del último minuto y se devuelve un blocked si este es >=5, o un intento logrado si este es <5, además en este último caso se agrega el inicio de sesión actual al diccionario creado cuando inició sesión por primera vez.


Además este módulo posee un método GET(), el cuál retorna una lista con todos los usuarios bloqueados actualmente, para acceder a ella hay que gestar una consulta GET() a la siguiente url:

- http://localhost:3001/blocked


- Configuración inicial del Server:
```
  server:
    container_name: server-node
    build: ../Server/
    networks:
      - lared
    ports:
      - 3001:3001
    volumes:
      - ../Server:/app
    environment:
      - kafka=kafka
```
