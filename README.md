# Worker Versioning Demo

## Rough notes
* Update repo permissions to allow read/write to the registry.
* Deploy the worker controller to K8s
  * Currently no configuration of controller - using all defaults.
  * ```helm install temporal-worker-controller  oci://docker.io/temporalio/temporal-worker-controller  --namespace temporal-worker-versioning```
* 
