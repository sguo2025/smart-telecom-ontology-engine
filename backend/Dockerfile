FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
# 不使用项目根的 mvnw（wrapper）文件，maven 镜像自带 mvn
# 只拷贝 pom.xml 和源码目录
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/smart-telecom-backend-0.1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
