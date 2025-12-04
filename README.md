# Worker Versioning Demo

## Rough notes
minikube start
* Update repo permissions to allow read/write to the registry.
* Deploy the worker controller to K8s
  * Currently no configuration of controller - using all defaults.
  * ```helm install temporal-worker-controller  oci://docker.io/temporalio/temporal-worker-controller  --namespace temporal-worker-versioning```
*
minikube addons enable ingress

and run minikube tunnel prior to running apps.

 
