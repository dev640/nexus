# ---- dependencies: cached layer for Maven downloads ----
FROM maven:3.9-eclipse-temurin-21 AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline

# ---- test: compile and run unit tests (no external services needed) ----
FROM deps AS test
WORKDIR /app
COPY src ./src
RUN mvn -B test

# ---- build: package the runnable jar ----
FROM deps AS build
WORKDIR /app
COPY src ./src
RUN mvn -B package -DskipTests

# ---- runtime ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
