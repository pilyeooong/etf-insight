declare const _default: {
    appName: string;
    web: {
        host: string;
        port: number;
        commands: {
            dev: string;
            build: string;
        };
    };
    webViewProps: {
        type: "partner" | "external" | "game";
        allowsInlineMediaPlayback: boolean;
        bounces: boolean;
        pullToRefreshEnabled: boolean;
        overScrollMode: "always" | "content" | "never";
        mediaPlaybackRequiresUserAction: boolean;
        allowsBackForwardNavigationGestures: boolean;
    };
    outdir: string;
    brand: {
        displayName: string;
        primaryColor: string;
        icon: string;
    };
    permissions: ({
        name: "clipboard";
        access: "read" | "write";
    } | {
        name: "geolocation";
        access: "access";
    } | {
        name: "contacts";
        access: "read" | "write";
    } | {
        name: "photos";
        access: "read" | "write";
    } | {
        name: "camera";
        access: "access";
    } | {
        name: "microphone";
        access: "access";
    })[];
    navigationBar: {
        withBackButton: boolean;
        withHomeButton: boolean;
        transparentBackground: boolean;
        theme: "light" | "dark";
        initialAccessoryButton: {
            id: string;
            title: string;
            icon: {
                source: {
                    uri: string;
                };
                name: never;
            } | {
                name: string;
                source: never;
            };
        };
    };
};
export default _default;
