var PostalFsmProvider = function() {
	var eventTransformations = {},
		wireHandlersToBus = function(fsm) {
			fsm.messaging.subscriptions.push(
				postal.subscribe(fsm.messaging.handlerNamespace, "*", function(data, envelope){
					this.handle.call(this, envelope.topic, data);
				}).withContext(fsm)
			);
		},
		wireEventsToBus = function(fsm) {
			fsm.messaging.eventPublisher = function(){
				var topic = arguments[0],
					payload = _.deepExtend({}, slice.call(arguments, 1));
				if(eventTransformations[topic]) {
					payload = eventTransformations[topic](payload);
				}
				postal.publish(fsm.messaging.eventNamespace, topic, payload);
			};
			fsm.on("*", fsm.messaging.eventPublisher);
		};
	return {
		wireUp: function(fsm) {
			wireHandlersToBus(fsm);
			wireEventsToBus(fsm);
		},
		addEventTransforms: function(transforms) {
			_.deepExtend(eventTransformations, transforms);
		}
	};
};
messageBusProvider.postal = new PostalFsmProvider();
messageBusProvider.postal.addEventTransforms(utils.standardEventTransforms);