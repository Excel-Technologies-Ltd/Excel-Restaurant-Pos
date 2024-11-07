
import { PiSpinnerThin } from 'react-icons/pi'

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <PiSpinnerThin className=" animate-spin text-[4rem]" />
        </div>
    )
}

export default Loading