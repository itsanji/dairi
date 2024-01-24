import { toast } from "react-toastify";

const log = {
    warn(content: string, withToast: boolean = false) {
        if (withToast) {
            toast.warn(content);
        }
        console.log(`%c${content}', 'background: yellow; color: black`);
    }
};

export default log;
